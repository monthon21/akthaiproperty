import { google } from "googleapis";
import { Readable } from "stream";

// Scope for Google Drive access
const SCOPES = ["https://www.googleapis.com/auth/drive"];

let driveClient: any = null;

/**
 * Initializes and retrieves the Google Drive client.
 * Supports both OAuth2 Refresh Token (for personal Google Drive) 
 * and Service Account (for Workspace Shared Drives).
 */
export function getDriveClient() {
  if (driveClient) return driveClient;

  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!parentFolderId) {
    console.error("❌ GOOGLE_DRIVE_FOLDER_ID is not configured in environment variables.");
    throw new Error("ระบบเชื่อมต่อ Google Drive ยังไม่ได้กำหนดค่า GOOGLE_DRIVE_FOLDER_ID ใน env");
  }

  // Option 1: OAuth2 Refresh Token (Recommended for Personal @gmail.com accounts)
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (refreshToken && clientId && clientSecret) {
    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
      driveClient = google.drive({ version: "v3", auth: oauth2Client });
      console.log("🔒 Google Drive authenticated successfully using OAuth2 Refresh Token.");
      return driveClient;
    } catch (error) {
      console.error("❌ Error initializing Google OAuth2 client:", error);
      throw new Error("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Drive API ด้วย OAuth2");
    }
  }

  // Option 2: Service Account (Recommended for Google Workspace Shared Drives)
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (email && privateKey) {
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    try {
      const auth = new google.auth.JWT({
        email,
        key: formattedPrivateKey,
        scopes: SCOPES,
      });
      driveClient = google.drive({ version: "v3", auth });
      console.log("🔒 Google Drive authenticated successfully using Service Account JWT.");
      return driveClient;
    } catch (error) {
      console.error("❌ Error initializing Google JWT auth client:", error);
      throw new Error("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Drive API ด้วย Service Account");
    }
  }

  throw new Error("กรุณากำหนดค่า Google Drive Credentials อย่างใดอย่างหนึ่งใน env (OAuth2 หรือ Service Account)");
}

/**
 * Finds a folder by name inside a parent folder, or creates it if it doesn't exist.
 * Sets the folder to be publicly readable. Supports Shared Drives.
 * 
 * @param folderName The name of the folder to find or create.
 * @param parentId The parent folder ID under which to look/create. Defaults to root GOOGLE_DRIVE_FOLDER_ID.
 */
export async function getOrCreateFolder(folderName: string, parentId?: string): Promise<string> {
  const drive = getDriveClient();
  const actualParentId = parentId || process.env.GOOGLE_DRIVE_FOLDER_ID!;

  try {
    // Search for existing folder, supporting Shared Drives search
    const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and '${actualParentId}' in parents and trashed = false`;
    const response = await drive.files.list({
      q,
      spaces: "drive",
      fields: "files(id, name)",
      pageSize: 1,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      return files[0].id!;
    }

    // If not found, create new folder
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [actualParentId],
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
      supportsAllDrives: true,
    });

    const folderId = folder.data.id!;

    // Set permission to public reader
    try {
      await drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        supportsAllDrives: true,
      });
    } catch (permError) {
      console.warn("⚠️ Warning: Could not set public permissions on folder:", folderName, permError);
    }

    return folderId;
  } catch (error: any) {
    console.error(`❌ Error in getOrCreateFolder for "${folderName}":`, error);
    throw new Error(`ไม่สามารถสร้างหรือค้นหาโฟลเดอร์ "${folderName}" บน Google Drive ได้: ${error.message}`);
  }
}

/**
 * Uploads a file buffer directly to Google Drive in the specified folder.
 * Sets the file permission to public reader. Supports Shared Drives.
 * 
 * @param fileBuffer The buffer containing the file content.
 * @param fileName The name of the file.
 * @param mimeType The mime type of the file.
 * @param folderId The ID of the folder to upload the file to.
 */
export async function uploadToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string
): Promise<{ id: string; url: string }> {
  const drive = getDriveClient();

  try {
    // Create direct read stream from buffer
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: mimeType,
        body: stream,
      },
      fields: "id, name",
      supportsAllDrives: true,
    });

    const fileId = response.data.id!;

    // Set permission to public read
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        supportsAllDrives: true,
      });
    } catch (permError) {
      console.warn(`⚠️ Warning: Could not set public permission on file: ${fileName} (${fileId})`, permError);
    }

    // Direct preview link format
    const url = `https://lh3.googleusercontent.com/d/${fileId}`;

    return { id: fileId, url };
  } catch (error: any) {
    console.error(`❌ Error uploading file "${fileName}" to Google Drive:`, error);
    throw new Error(`อัพโหลดไฟล์ "${fileName}" ขึ้น Google Drive ล้มเหลว: ${error.message}`);
  }
}
