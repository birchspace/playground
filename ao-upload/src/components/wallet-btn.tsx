"use client";

import React from "react";

import { useAtom } from "jotai";
import { shortenString } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { AOS, WALLET_PERMISSIONS } from "~/config/wallet";
import {
  walletAddressAtom,
  walletConnectedAtom,
  walletProfileAtom,
} from "~/jotai/wallet";
import { readHandler } from "~/lib/helper/read-handler";

export function WalletButton() {
  const [walletProFile, setWalletProFile] = useAtom(walletProfileAtom);
  const [walletAddress, setWalletAddress] = useAtom(walletAddressAtom);
  const [walletConnected, setWalletConnected] = useAtom(walletConnectedAtom);

  const arConnectHandle = async () => {
    if (!walletAddress) {
      if (window.arweaveWallet) {
        try {
          await global.window?.arweaveWallet?.connect(
            WALLET_PERMISSIONS as unknown,
          );
          setWalletAddress(
            await global.window.arweaveWallet.getActiveAddress(),
          );
        } catch (e: unknown) {
          console.error(e);
        }
      }
    }
  };

  const disconnectHandle = async () => {
    await global.window?.arweaveWallet?.disconnect();
    setWalletAddress(null);
    setWalletConnected(false);
  };

  const getProfile = async (args: { address: string }) => {
    const emptyProfile = {
      id: null,
      walletAddress: args.address,
      displayName: null,
      username: null,
      bio: null,
      avatar: null,
      banner: null,
    };

    try {
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
          return {
            id: activeProfileId,
            walletAddress: fetchedProfile.Owner || null,
            displayName: fetchedProfile.Profile.DisplayName || null,
            username: fetchedProfile.Profile.UserName || null,
            bio: fetchedProfile.Profile.Description || null,
            avatar: fetchedProfile.Profile.ProfileImage || null,
            banner: fetchedProfile.Profile.CoverImage || null,
          };
        } else return emptyProfile;
      } else return emptyProfile;
    } catch (error) {
      const err = error as Error;
      throw err;
    }
  };

  React.useEffect(() => {
    if (walletAddress) {
      setWalletConnected(true);
    }
  }, [setWalletConnected, walletAddress]);

  React.useEffect(() => {
    void (async function () {
      if (walletAddress) {
        try {
          setWalletProFile(await getProfile({ address: walletAddress }));
        } catch (error) {
          console.log("get profile error:", error);
        }
      }
    })();
  }, [setWalletProFile, walletAddress]);

  return (
    <div className="flex items-center gap-4 p-2">
      <Button variant="ringHover" onClick={arConnectHandle}>
        {walletAddress ? shortenString(walletAddress) : "Connect Wallet"}
      </Button>
      {walletConnected && (
        <Button onClick={disconnectHandle} variant="shine">
          Disconnect
        </Button>
      )}
    </div>
  );
}
