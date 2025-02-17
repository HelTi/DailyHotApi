import type { RouterData, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "jin10",
    title: "金十数据",
    type: "推荐榜",
    description: "金十数据",
    link: "https://www.jin10.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean): Promise<RouterResType> => {
  const url = "https://cdn.jin10.com/json/index/latest_news.json";
  const result = await get({
    url,
    noCache,
    headers: {
      Referer: "https://xnews.jin10.com/",
    },
  });
  const list = result.data.list;
  return {
    ...result,
    data: list.map((v: RouterType["jin10"]) => ({
      id: v.id,
      title: v.title,
      cover: v.mobile_thumbs?.[0] || undefined,
      desc: v?.introduction,
      author: undefined,
      timestamp: getTime(v.display_datetime),
      hot: null,
      url: v?.source_url ? v.source_url : `https://xnews.jin10.com/details/${v.id}`,
      mobileUrl:v?.source_url ? v.source_url : `https://xnews.jin10.com/details/${v.id}`,
    })),
  };
};
