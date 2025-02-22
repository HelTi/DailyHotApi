import type { RouterType } from "../router.types.js";
import type { ListItem, RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { headers } from "./juejin.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "kuaishou",
    title: "快手",
    type: "热榜",
    description: "快手，拥抱每一种生活",
    link: "https://www.kuaishou.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://www.kuaishou.com/?isHome=1`;
  const result = await get({
    url,
    noCache,
    headers: {
      ...headers
    },
  });
  const listData: ListItem[] = [];
  // 获取主要内容
  const pattern = /window.__APOLLO_STATE__=(.*);\(function\(\)/s;
  const matchResult = result.data?.match(pattern);
  if (!matchResult?.[1]) {
    return {
      ...result,
      data: [],
    };
  }
  const jsonObject = JSON.parse(matchResult[1])["defaultClient"];
  // 获取所有分类
  const allItems = jsonObject['$ROOT_QUERY.visionHotRank({"page":"home"})'].items;
  // 获取全部热榜
  allItems?.forEach((item: { id: string }) => {
    // 基础数据
    const hotItem: RouterType["kuaishou"] = jsonObject[item.id];
    const id = hotItem.photoIds?.json?.[0];
    listData.push({
      id: hotItem?.id,
      title: hotItem?.name,
      cover: hotItem?.poster || '',
      hot: hotItem?.hotValue || '-',
      timestamp: undefined,
      url: `https://www.kuaishou.com/short-video/${id}`,
      mobileUrl: `https://www.kuaishou.com/short-video/${id}`,
    });
  });
  return {
    ...result,
    data: listData,
  };
};
