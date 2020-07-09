/*
 * Created on Sun Jun 28 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import { SessionApiClient, RequestHeader } from "./web-api-client";
import { Long } from "bson";
import { BasicHeaderDecorator } from "./api-header-decorator";
import { OpenRecommendStruct } from "../talk/struct/api/open/open-recommend-struct";
import { OpenPresetStruct } from "../talk/struct/api/open/open-preset-struct";
import { OpenPostListStruct, OpenPostReactStruct } from "../talk/struct/api/open/open-post-struct";
import { OpenStruct } from "../talk/struct/api/open/open-struct";
import { OpenSearchType, OpenSearchStruct, OpenPostSearchStruct } from "../talk/struct/api/open/open-search-struct";
import { LinkReactionType } from "../talk/struct/open/open-link-struct";
import { JsonUtil } from "../util/json-util";

export class OpenChatClient extends SessionApiClient {

    get Scheme() {
        return 'https';
    }

    get Host() {
        return 'open.kakao.com';
    }

    fillHeader(header: RequestHeader) {
        try {
            super.fillHeader(header);
        } catch (e) { // try without auth
            BasicHeaderDecorator.INSTANCE.fillHeader(header);
        }
    }

    async getCoverPreset(): Promise<OpenPresetStruct> {
        return this.requestMapped('GET', OpenChatClient.getChannelApiPath('link/image/preset'), OpenPresetStruct.MAPPER);
    }

    async requestRecommend(): Promise<OpenRecommendStruct> {
        return this.requestMapped('GET', OpenChatClient.getChannelApiPath('recommend'), OpenRecommendStruct.MAPPER);
    }

    async requestRecommendPostList(): Promise<unknown> {
        return this.request('GET', OpenChatClient.getProfileApiPath('recommend'));
    }

    async requestNewReactionList(): Promise<unknown> {
        return this.request('GET', OpenChatClient.getProfileApiPath('reacts/newMark')); 
    }

    async setRecommend(linkId: Long): Promise<OpenStruct> {
        return this.request('GET', OpenChatClient.getChannelApiPath(`search/recommend?li=${encodeURIComponent(linkId.toString())}`));
    }

    async excludeRecommend(linkId: Long): Promise<OpenStruct> {
        return this.request('GET', OpenChatClient.getChannelApiPath(`search/exclude?li=${encodeURIComponent(linkId.toString())}`));
    }

    async requestPostList(linkId: Long): Promise<OpenPostListStruct> {
        return this.requestMapped('GET', OpenChatClient.getProfileApiPath(`${encodeURIComponent(linkId.toString())}/posts/all`), OpenPostListStruct.MAPPER);
    }

    async getPostFromId(linkId: Long, postId: Long, userLinkId: Long): Promise<unknown>  {
        return this.request('GET', OpenChatClient.getProfileApiPath(`${encodeURIComponent(linkId.toString())}/posts/${encodeURIComponent(postId.toString())}?actorLinkId=${encodeURIComponent(userLinkId.toString())}`));
    }

    async getPostFromURL(postURL: string, userLinkId: Long): Promise<unknown>  {
        return this.request('GET', OpenChatClient.getProfileApiPath(`post?postUrl=${encodeURIComponent(postURL)}&actorLinkId=${encodeURIComponent(userLinkId.toString())}`));
    }

    async createPost(userLinkId: Long, description: string, postDataList: unknown[], scrapData: unknown, shareChannelList: Long[]): Promise<unknown> {
        let postForm = {

            description: description,
            postDatas: JsonUtil.stringifyLoseless(postDataList),
            scrapData: JsonUtil.stringifyLoseless(scrapData),
            chatIds: JsonUtil.stringifyLoseless(shareChannelList)

        };

        return this.request('POST', OpenChatClient.getProfileApiPath(`${encodeURIComponent(userLinkId.toString())}/posts`), postForm);
    }

    async updatePost(userLinkId: Long, postId: Long, description: string, scrapData: unknown): Promise<unknown> {
        let postForm = {

            description: description,
            scrapData: JsonUtil.stringifyLoseless(scrapData)

        };

        return this.request('PUT', OpenChatClient.getProfileApiPath(`${encodeURIComponent(userLinkId.toString())}/posts/${encodeURIComponent(postId.toString())}`), postForm);
    }

    async deletePost(userLinkId: Long, postId: Long): Promise<unknown> {
        return this.request('DELETE', OpenChatClient.getProfileApiPath(`${encodeURIComponent(userLinkId.toString())}/posts/${encodeURIComponent(postId.toString())}`));
    }

    async reactToPost(linkId: Long, postId: Long, userLinkId: Long): Promise<OpenPostReactStruct> {
        return this.request('POST', OpenChatClient.getProfileApiPath(`${encodeURIComponent(linkId.toString())}/reacts/${encodeURIComponent(postId.toString())}?type=${LinkReactionType.NORMAL}&actorLinkId=${encodeURIComponent(userLinkId.toString())}`));
    }

    async unReactPost(linkId: Long, postId: Long, userLinkId: Long): Promise<OpenStruct> {
        return this.request('DELETE', OpenChatClient.getProfileApiPath(`${encodeURIComponent(linkId.toString())}/reacts/${encodeURIComponent(postId.toString())}?actorLinkId=${encodeURIComponent(userLinkId.toString())}`));
    }

    async searchAll(query: string, searchType: OpenSearchType | null = null, page: number = 1, exceptLock: boolean = false, count: number = 30): Promise<OpenSearchStruct> {
        let queries = `q=${encodeURIComponent(query)}&s=l&p=${encodeURIComponent(page)}&c=${encodeURIComponent(count)}&exceptLock=${exceptLock ? 'Y' : 'N'}`;

        if (searchType) queries += `&resultType=${searchType}`;

        return this.requestMapped('GET', OpenChatClient.getChannelApiPath(`search/unified?${queries}`), OpenSearchStruct.MAPPER);
    }

    async searchPost(query: string, page: number = 1, count: number = 30): Promise<OpenPostSearchStruct> {
        return this.requestMapped('GET', OpenChatClient.getChannelApiPath(`search/post?q=${encodeURIComponent(query)}&p=${encodeURIComponent(page)}&c=${encodeURIComponent(count)}`), OpenPostSearchStruct.MAPPER);
    }

    static getProfileApiPath(api: string) {
        return `profile/${api}`;
    }

    static getChannelApiPath(api: string) {
        return `c/${api}`;
    }

}