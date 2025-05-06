import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import UserAgent from "user-agents";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "zhihu",
    title: "知乎",
    type: "热榜",
    link: "https://www.zhihu.com/hot",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface ZhihuHotItem {
  id: string;
  title: string;
  desc: string;
  cover: string;
  timestamp: number;
  hot: number;
  url: string;
  mobileUrl: string;
}

interface ZhihuApiItem {
  target: {
    id: string;
    title: string;
    excerpt: string;
    image_url?: string;
    thumbnail?: string;
  };
  detail_text?: string;
  id?: string;
  card_id?: string;
  children?: Array<{
    thumbnail?: string;
  }>;
}

const getList = async (noCache: boolean) => {
  // api 接口
  const url = `https://api.zhihu.com/topstory/hot-list`;

  // 生成随机用户代理
  const userAgent = new UserAgent();

  // 添加更全面的请求头信息
  const headers = {
    "User-Agent": userAgent.toString(),
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    Connection: "keep-alive",
    Referer: "https://www.zhihu.com/hot",
    Origin: "https://www.zhihu.com",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "Sec-Ch-Ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"macOS"',
    "X-Requested-With": "XMLHttpRequest",
    "X-UDID": generateRandomId(32),
    "X-API-VERSION": "3.0.53",
  };

  try {
    const result = await get({
      url,
      noCache,
      headers,
      params: {
        limit: 50,
        reverse_order: 0,
        _t: Date.now(),
      },
    });

    // 解析API返回数据
    const list: ZhihuHotItem[] = (result.data?.data || [])
      .map((v: ZhihuApiItem) => {
        const data = v.target;
        if (!data) return null;

        const q_id = v?.card_id?.split("_")?.[1] || data?.id || "";

        return {
          id: data.id || "",
          title: data.title || "",
          desc: data.excerpt || "",
          cover: v.children?.[0]?.thumbnail || "",
          timestamp: Date.now(),
          hot: v.detail_text ? parseFloat(v.detail_text.split(" ")[0]) * 10000 : 0,
          url: `https://www.zhihu.com/question/${q_id}`,
          mobileUrl: `https://www.zhihu.com/question/${q_id}`,
        };
      })
      .filter(Boolean);

    return {
      ...result,
      data: list,
    };
  } catch {
    // 如果主API失败，尝试备用方法
    try {
      return await getFallbackList(noCache);
    } catch {
      // 如果备用方法也失败，返回空列表
      return {
        data: [],
        fromCache: false,
        updateTime: new Date().toISOString(),
      };
    }
  }
};

// 备用获取方法，使用不同的API路径
const getFallbackList = async (noCache: boolean) => {
  const url = `https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50&desktop=true`;

  // 生成随机用户代理
  const userAgent = new UserAgent();

  const headers = {
    "User-Agent": userAgent.toString(),
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    Connection: "keep-alive",
    Referer: "https://www.zhihu.com/hot",
    Origin: "https://www.zhihu.com",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "Sec-Ch-Ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"macOS"',
    "X-Requested-With": "XMLHttpRequest",
    "X-UDID": generateRandomId(32),
    "X-API-VERSION": "3.0.53",
  };

  const result = await get({
    url,
    noCache,
    headers,
    params: {
      // 添加随机参数
      _t: Date.now(),
    },
  });

  const list: ZhihuHotItem[] = (result.data?.data || [])
    .map((v: ZhihuApiItem) => {
      const data = v.target;
      if (!data) return null;

      const q_id = v?.card_id?.split("_")?.[1] || data?.id || "";

      return {
        id: data.id || "",
        title: data.title || "",
        desc: data.excerpt || "",
        cover: v.children?.[0]?.thumbnail || "",
        timestamp: Date.now(),
        hot: v.detail_text ? parseFloat(v.detail_text.split(" ")[0]) * 10000 : 0,
        url: `https://www.zhihu.com/question/${q_id}`,
        mobileUrl: `https://www.zhihu.com/question/${q_id}`,
      };
    })
    .filter(Boolean);

  return {
    ...result,
    data: list,
  };
};

// 生成随机ID，用于模拟浏览器行为
function generateRandomId(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
