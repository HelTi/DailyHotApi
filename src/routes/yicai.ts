import type { RouterType } from "../router.types.js";
import { RouterResType } from "../types.js";
import { get } from "../utils/getData.js";
import { headers } from "./juejin.js";
import * as cheerio from "cheerio";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData = {
    name: "yicai",
    title: "第一财经",
    type: "头条",
    description: "头条",
    link: "https://www.yicai.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean): Promise<RouterResType> => {
  const url = "https://www.yicai.com/";
  const result = await get({
    url,
    noCache,
    headers: {
      ...headers,
      Referer: "https://www.yicai.com/",
    },
  });

   const $ = cheerio.load(result?.data);
   const list: RouterType['yicai'][] = [];

   $('#headlist a').each((index, element) => {
     const title = $(element).find('h2').text().trim();
     const link = $(element).attr('href');
     const imgSrc = $(element).find('img').attr('src');
     const description = $(element).find('p').text().trim();
     const time = $(element).find('.rightspan span:last-child').text().trim();
     const hot = Number($(element).find('.news_hot').text().trim())
 
     list.push({
       title,
       link,
       imgSrc,
       description,
       time,
       hot,
     });
   });
   
  

  return {
    ...result,
    data: list.map((v) => ({
      id: v.link?.match(/\d+/)?.[0] || '',
      title: v.title,
      cover: v.imgSrc || undefined,
      desc: v.description,
      author: undefined,
      timestamp: Date.now(),
      hot: v.hot,
      url: `https://www.yicai.com${v.link}`,
      mobileUrl: `https://www.yicai.com${v.link}`,
    })),
  };

};
