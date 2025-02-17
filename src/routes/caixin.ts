import type { RouterType } from "../router.types.js";
import { RouterResType } from "../types.js";
import { get } from "../utils/getData.js";
import { headers } from "./juejin.js";
import * as cheerio from "cheerio";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData = {
    name: "yicai",
    title: "财新网",
    type: "热点",
    description: "热点",
    link: "https://www.caixin.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean): Promise<RouterResType> => {
  const url = "https://www.caixin.com/";
  const result = await get({
    url,
    noCache,
    headers: {
      ...headers,
      Referer: "https://www.caixin.com/",
    },
  });

   const $ = cheerio.load(result?.data);
   const list: RouterType['caixin'][] = [];

   $('.news_list dl').each((index, element) => {
     const title = $(element).find('dd p a').text().trim();
     const link = $(element).find('dd p a').attr('href');
     const imgSrc = $(element).find('dt img').attr('src');
     const author = $(element).find('dd span').text().trim();
 
     list.push({
       title,
       link,
       imgSrc,
       author,
     });
   });
   
  

  return {
    ...result,
    data: list.map((v) => ({
      id: v.link?.match(/\d+/)?.[0] || '',
      title: v.title,
      cover: v.imgSrc || undefined,
      desc: '',
      author: v.author,
      timestamp: undefined,
      hot: undefined,
      url: v.link || '',
      mobileUrl: v.link || '',
    })),
  };

};
