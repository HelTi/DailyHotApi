import type { RouterData, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "wallstreetcn",
    title: "华尔街见闻",
    type: "热门文章",
    description: "热门文章",
    link: "https://wallstreetcn.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean): Promise<RouterResType> => {
  const url = "https://api-one-wscn.awtmt.com/apiv1/content/articles/hot?period=all";
  const result = await get({
    url,
    noCache,
    headers: {
      Referer: "https://wallstreetcn.com/",
    },
  });
  const list = result.data.data?.day_items;
  return {
    ...result,
    data: list.map((v: RouterType["wallstreet"]) => ({
      id: v.id,
      title: v.title,
      timestamp: getTime(v?.display_time),
      hot: v?.pageviews,
      url: v?.uri
    })),
  };
};
