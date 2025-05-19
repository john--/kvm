import { useRef } from "react";
import { useClose } from "@headlessui/react";

import { GridCard } from "@components/Card";
import { TextAreaWithLabel } from "@components/TextArea";
import { Button } from "@components/Button";

export default function ExtractedTextModal({
  extractedText,
}: {
  extractedText: string | null;
}) {
  const TextAreaRef = useRef<HTMLTextAreaElement>(null);
  const close = useClose();

  return (
    <GridCard>
      <div className="p-4 py-3 space-y-4">
        <div className="space-y-4">
          <TextAreaWithLabel
            className="w-full"
            ref={TextAreaRef}
            label="Extracted Text"
            rows={6}
            value={extractedText || ""}
            readOnly
          />
        </div>
        <div
          className="flex items-center justify-end animate-fadeIn gap-x-2"
          style={{
            animationDuration: "0.7s",
            animationDelay: "0.2s",
          }}
        >
          <Button size="SM" theme="primary" text="Close" onClick={close} />
        </div>
      </div>
    </GridCard>
  );
}
