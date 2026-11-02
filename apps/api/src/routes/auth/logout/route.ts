import { cookies } from "../../../cookies";
import {
  AUTH_SESSION_COOKIE_NAME,
  clearAuthSession,
} from "../../../lib/auth/session-store";

export async function POST(request: Request) {
  const cookieStore = cookies(request);
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;

  clearAuthSession(sessionId);
  cookieStore.delete(AUTH_SESSION_COOKIE_NAME);

  return cookieStore.apply(Response.json(
    {
      requestStatus: "success",
      message: "已退出登录。",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Language": "zh-CN",
      },
    },
  ));
}
