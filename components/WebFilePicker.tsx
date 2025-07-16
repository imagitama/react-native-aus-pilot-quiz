import React, { useRef } from "react";

const WebFilePicker = <T,>({ onData }: { onData: (data: T) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);

        console.log("Loaded JSON:", json);

        onData(json);
      } catch (err) {
        console.error("Invalid JSON file:", err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <button onClick={handleFilePick}>Choose JSON File</button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default WebFilePicker;
