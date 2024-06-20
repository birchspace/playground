import { dryrun } from "@permaweb/aoconnect";

import type { TagType } from "~/types";

interface ReadHandleProps {
    processId: string;
    action: string;
    tags?: TagType[];
    data?: any;
}

export async function readHandler(args: ReadHandleProps): Promise<any> {
    const tags = [{ name: 'Action', value: args.action }];
    if (args.tags) tags.push(...args.tags);

    const response = await dryrun({
        process: args.processId,
        tags: tags,
        data: JSON.stringify(args.data || {}),
    });

    if (response.Messages && response.Messages.length) {
        if (response.Messages[0].Data) {
            return JSON.parse(response.Messages[0].Data);
        } else {
            if (response.Messages[0].Tags) {
                return response.Messages[0].Tags.reduce((acc: any, item: any) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {});
            }
        }
    }
}
