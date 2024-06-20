"use client";

import React from "react";

import { useAtom } from "jotai";
import { TAGS } from "~/config/file";
import { getGQLData } from "~/lib/gql";
import { Paperclip } from "lucide-react";
import { assetFileAtom } from "~/jotai/file";
import { AOS, GATEWAYS } from "~/config/wallet";
import { walletProfileAtom } from "~/jotai/wallet";
import { getTxEndpoint } from "~/lib/helper/endpoints";
import { FileUploaderItem } from "~/components/file-upload";
import { FileUploaderContent } from "~/components/file-upload";
import { fileToBuffer, stripFileExtension } from "~/lib/utils";
import { FileUploader, FileInput } from "~/components/file-upload";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";

import type { TagType } from "~/types";
import { Button } from "./ui/button";

const FileSvgDraw = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <svg
        className="h-8 w-8 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
    </div>
  );
};

export const FileUploaderCard = () => {
  const [walletProfile] = useAtom(walletProfileAtom);
  const [files, setFiles] = React.useState<File[] | null>(null);
  const [assetFile, setAssetFile] = useAtom(assetFileAtom);

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  React.useEffect(() => {
    if (files?.[0]) {
      setAssetFile(files[0]);
    }
  }, [files, setAssetFile]);

  const uploadHandle = async () => {
    const dateTime = new Date().getTime().toString();
    const title = stripFileExtension(assetFile?.name);
    const description = stripFileExtension(assetFile?.name);

    if (assetFile?.type && walletProfile?.id && description && title) {
      try {
        const assetTags: TagType[] = [
          { name: TAGS.keys.contentType, value: assetFile?.type },
          { name: TAGS.keys.creator, value: walletProfile?.id },
          { name: TAGS.keys.ans110.title, value: title },
          { name: TAGS.keys.ans110.description, value: description },
          { name: TAGS.keys.ans110.type, value: assetFile?.type },
          { name: TAGS.keys.ans110.implements, value: TAGS.values.ansVersion },
          { name: TAGS.keys.dateCreated, value: dateTime },
          { name: "Action", value: "Add-Uploaded-Asset" },
        ];

        const aos = connect();

        let processSrc = null;
        const buffer: any = await fileToBuffer(assetFile);

        try {
          const processSrcFetch = await fetch(getTxEndpoint(AOS.assetSrc));
          if (processSrcFetch.ok) {
            processSrc = await processSrcFetch.text();
          }
        } catch (e: any) {
          console.error(e);
        }

        if (processSrc) {
          processSrc = processSrc.replace("[Owner]", `['${walletProfile.id}']`);
          processSrc = processSrc.replaceAll("<NAME>", title);
          processSrc = processSrc.replaceAll("<TICKER>", "ATOMIC");
          processSrc = processSrc.replaceAll("<DENOMINATION>", "1");
          processSrc = processSrc.replaceAll("<BALANCE>", "1");
        }

        const arweaveWallet = globalThis.arweaveWallet;

        const processId = await aos.spawn({
          module: AOS.module,
          scheduler: AOS.scheduler,
          signer: createDataItemSigner(arweaveWallet),
          tags: assetTags,
          data: buffer,
        });

        console.log(`Collection process: ${processId}`);

        let fetchedCollectionId;
        let retryCount: number = 0;

        while (!fetchedCollectionId) {
          await new Promise((r) => setTimeout(r, 2000));
          const gqlResponse = await getGQLData({
            gateway: GATEWAYS.goldsky,
            ids: [processId],
            tagFilters: null,
            owners: null,
            cursor: null,
            reduxCursor: null,
            cursorObjectKey: null,
          });

          if (gqlResponse && gqlResponse.data.length && gqlResponse.data[0]) {
            console.log(
              `Fetched transaction`,
              gqlResponse.data[0].node.id,
              retryCount,
            );
            fetchedCollectionId = gqlResponse.data[0].node.id;
          } else {
            console.log(`Transaction not found`, processId, retryCount);
            retryCount++;
            if (retryCount >= 10) {
              throw new Error(
                `Transaction not found after 10 attempts, contract deployment retries failed`,
              );
            }
          }
        }
      } catch (err) {}
    }
  };

  return (
    <FileUploader
      value={files}
      onValueChange={setFiles}
      dropzoneOptions={dropZoneConfig}
      className="relative rounded-lg p-2"
    >
      <FileInput className="outline-dashed outline-1 outline-foreground/20">
        <div className="flex w-full flex-col items-center justify-center pb-4 pt-3 ">
          <FileSvgDraw />
        </div>
      </FileInput>
      <FileUploaderContent>
        {files &&
          files.length > 0 &&
          files.map((file, i) => (
            <div key={i} className="flex flex-col gap-2 border p-2">
              <FileUploaderItem index={i}>
                <Paperclip className="h-4 w-4 stroke-current" />
                <span>{file.name}</span>
                <Button onClick={uploadHandle} className="z-10 h-4 w-fit">
                  Upload
                </Button>
              </FileUploaderItem>
            </div>
          ))}
      </FileUploaderContent>
    </FileUploader>
  );
};
