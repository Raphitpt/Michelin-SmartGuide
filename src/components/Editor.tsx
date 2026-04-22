"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

interface CustomEditorProps {
  initialValue?: string;
  onEditorChange: (content: string) => void;
}

export default function CustomEditor({
  initialValue = "",
  onEditorChange,
}: CustomEditorProps) {
  const editorRef = useRef(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      onInit={(_evt, editor) => (editorRef.current = editor)}
      initialValue={initialValue}
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
      onEditorChange={onEditorChange}
    />
  );
}
