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
      tinymceScriptSrc="/tinymce/js/tinymce/tinymce.min.js"
      onInit={(_evt, editor) => (editorRef.current = editor)}
      value={initialValue}
      init={{
        license_key: "gpl",
        height: 500,
        menubar: false,
        // plugins: [
        //   "advlist",
        //   "autolink",
        //   "lists",
        //   "link",
        //   "image",
        //   "charmap",
        //   "anchor",
        //   "searchreplace",
        //   "visualblocks",
        //   "code",
        //   "fullscreen",
        //   "insertdatetime",
        //   "media",
        //   "table",
        //   "preview",
        //   "help",
        //   "wordcount",
        // ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        directionality: "ltr",
        body_attrs: { dir: "ltr" },
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; direction: ltr; text-align: left; }",
        setup: (editor: {
          on: (event: string, cb: () => void) => void;
          getBody: () => HTMLElement;
          getDoc: () => Document;
        }) => {
          editor.on("init", () => {
            const body = editor.getBody();
            body.setAttribute("dir", "ltr");
            body.style.direction = "ltr";
            body.style.textAlign = "left";
            editor.getDoc().documentElement.setAttribute("dir", "ltr");
          });
        },
      }}
      onEditorChange={onEditorChange}
    />
  );
}
