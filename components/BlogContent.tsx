"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";

export default function BlogContent({ content }: { content: string }) {
  return (
    <div data-color-mode="dark" className="blog-content">
      <style>{`
        .blog-content .wmde-markdown {
          background: transparent !important;
          font-family: inherit;
        }
        .blog-content .wmde-markdown h1,
        .blog-content .wmde-markdown h2,
        .blog-content .wmde-markdown h3,
        .blog-content .wmde-markdown h4 {
          color: #BEAF87 !important;
          font-weight: 800;
          letter-spacing: -0.02em;
          border-bottom: 1px solid rgba(190,175,135,0.2);
          padding-bottom: 0.4em;
          margin-top: 1.8em;
        }
        .blog-content .wmde-markdown h1 { font-size: 1.9em; }
        .blog-content .wmde-markdown h2 { font-size: 1.5em; }
        .blog-content .wmde-markdown h3 { font-size: 1.25em; color: #d4c499 !important; }
        .blog-content .wmde-markdown h4 { font-size: 1.1em; color: #e0d4ae !important; border-bottom: none; }
        .blog-content .wmde-markdown p {
          color: rgba(255,255,255,0.80) !important;
          line-height: 1.85;
          margin-bottom: 1em;
        }
        .blog-content .wmde-markdown strong {
          color: #ffffff !important;
          font-weight: 700;
        }
        .blog-content .wmde-markdown a {
          color: #BEAF87 !important;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .blog-content .wmde-markdown ul,
        .blog-content .wmde-markdown ol {
          color: rgba(255,255,255,0.80) !important;
          padding-left: 1.5em;
        }
        .blog-content .wmde-markdown li { margin-bottom: 0.4em; }
        .blog-content .wmde-markdown blockquote {
          border-left: 3px solid #BEAF87;
          padding-left: 1em;
          color: rgba(255,255,255,0.6) !important;
          font-style: italic;
        }
        .blog-content .wmde-markdown code {
          background: rgba(190,175,135,0.12) !important;
          color: #BEAF87 !important;
          border-radius: 4px;
          padding: 2px 6px;
        }
        .blog-content .wmde-markdown img {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          margin: 1.5em auto;
          display: block;
          max-width: 100%;
        }
        .blog-content .wmde-markdown hr {
          border-color: rgba(255,255,255,0.1);
          margin: 2em 0;
        }
      `}</style>
      <MarkdownPreview
        source={content}
        style={{ background: "transparent" }}
      />
    </div>
  );
}
