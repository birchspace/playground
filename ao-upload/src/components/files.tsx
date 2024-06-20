"use client";

import { useAtom } from "jotai";
import Link from "next/link";
import React from "react";
import { REDIRECTS } from "~/config/file";
import { AOS, GATEWAYS, PAGINATORS } from "~/config/wallet";
import { walletAddressAtom, walletAssetsAtom } from "~/jotai/wallet";
import { getGQLData } from "~/lib/gql";
import { readHandler } from "~/lib/helper/read-handler";
import { CursorEnum, type GroupIndexType } from "~/types";

export function Files() {
  const [groupIndex, setGroupIndex] = React.useState<GroupIndexType | null>(
    null,
  );
  const [currentTableCursor, setCurrentTableCursor] = React.useState<
    string | null
  >(null);
  const [walletAddress] = useAtom(walletAddressAtom);
  const [walletAssets, setWalletAssets] = useAtom(walletAssetsAtom);

  async function getAssetIdsByUser(args: {
    address: string;
  }): Promise<string[]> {
    const profileLookup = await readHandler({
      processId: AOS.profileRegistry,
      action: "Get-Profiles-By-Delegate",
      data: { Address: args.address },
    });

    let activeProfileId;

    if (
      profileLookup &&
      profileLookup.length > 0 &&
      profileLookup[0].ProfileId
    ) {
      activeProfileId = profileLookup[0].ProfileId;
    }

    if (activeProfileId) {
      const fetchedProfile = await readHandler({
        processId: activeProfileId,
        action: "Info",
        data: null,
      });

      if (fetchedProfile) {
        const swapIds = [AOS.defaultToken, AOS.pixl];
        return fetchedProfile.Assets.map(
          (asset: { Id: string; Quantity: string }) => asset.Id,
        ).filter((id: string) => !swapIds.includes(id));
      } else return [];
    } else return [];
  }

  React.useEffect(() => {
    void (async function () {
      if (!walletAddress) return;
      try {
        const groups: GroupIndexType = [];
        const ids = await getAssetIdsByUser({
          address: walletAddress,
        });
        if (ids && ids.length) {
          const groupIndex = new Map(
            groups.map((group: any) => [group.index, group.ids]),
          );

          for (
            let i = 0, j = 0;
            i < ids.length;
            i += PAGINATORS.assetTable, j++
          ) {
            const cursorIds = [...ids].slice(i, i + PAGINATORS.assetTable);
            const newIndex = `index-${j}`;

            if (
              ![...groupIndex.values()].some((groupedIds: any) =>
                groupedIds.every(
                  (id: any, index: any) => id === cursorIds[index],
                ),
              ) ||
              newIndex === `index-0`
            ) {
              groups.push({
                index: newIndex,
                ids: cursorIds,
              });
            }
          }

          if (groups && groups.length) {
            setCurrentTableCursor(groups[0].index);
            setGroupIndex(groups);
          }
        }
      } catch (e: any) {
        console.error(e);
      }
    })();
  }, [walletAddress]);

  React.useEffect(() => {
    void (async function () {
      if (!walletAddress && !groupIndex) return;

      if (currentTableCursor && groupIndex) {
        try {
          const index = parseInt(currentTableCursor.match(/\d+/)[0], 10);
          const assetsResponse = await getGQLData({
            gateway: GATEWAYS.arweave,
            ids: groupIndex[index].ids,
            tagFilters: null,
            owners: null,
            cursor: null,
            reduxCursor: null,
            cursorObjectKey: CursorEnum.IdGQL,
          });
          if (assetsResponse) {
            setWalletAssets(assetsResponse.data);
            console.log("获取assets成功");
            console.log(setWalletAssets);
            console.log(assetsResponse.data);
          }
        } catch (error) {
          console.log("assetsResponse :", error);
        }
      }
    })();
  }, [currentTableCursor, groupIndex, setWalletAssets, walletAddress]);

  return (
    <div>
      {walletAssets?.map((item, index) => (
        <div key={index}>
          {item.cursor && (
            <Link href={REDIRECTS.bazar.asset(item.node.id)} target="'_blank'">
              {item.cursor}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
