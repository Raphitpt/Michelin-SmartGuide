"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

interface CustomEditorProps {
  onEditorChange: (content: string) => void;
  onSubmit: () => void;
}

export default function CustomEditor({
  onEditorChange,
  onSubmit,
}: CustomEditorProps) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey=""
      onInit={(_evt, editor) => (editorRef.current = editor)}
      initialValue="<p>This is the initial content of the editor.</p>"
      init={{
        height: 500,
        menubar: false,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "preview",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
      onChange={onEditorChange}
      onSubmit={onSubmit}
    />
  );
}
