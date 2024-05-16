import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const CHROMIUM_PATH =
  "https://vomrghiulbmrfvmhlflk.supabase.co/storage/v1/object/public/chromium-pack/chromium-v123.0.0-pack.tar";

async function getBrowser() {
  if (process.env.VERCEL_ENV === "production") {
    const chromium = await import("@sparticuz/chromium-min").then(
      (mod) => mod.default
    );

    const puppeteerCore = await import("puppeteer-core").then(
      (mod) => mod.default
    );

    const executablePath = await chromium.executablePath(CHROMIUM_PATH);

    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    return browser;
  } else {
    const puppeteer = await import("puppeteer").then((mod) => mod.default);

    const browser = await puppeteer.launch();
    return browser;
  }
}

export async function GET(request: NextRequest) {
  const browser = await getBrowser();

  const queryParams = request.nextUrl.searchParams;

  // Example usage
  const link = queryParams.get("link");
  const p = queryParams.get("p");

  if (p !== "nganiscool") {
    // throw
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const page = await browser.newPage();

  await page.goto("https://dlpanda.com/vi");

  await (page as any).evaluate(() => {
    const ins = document.querySelector("ins");
    if (ins) {
      ins.remove();
    }
  });

  // get at the input, fill it with a dummy url
  await page.waitForSelector("input#url");

  // make sure to url decode the link
  await page.type("input#url", decodeURIComponent(link as string));

  // get at the button with type submit, click it
  await page.click('button[type="submit"]');

  // wait for a video tag, and get the url of the video.
  const selector = "video source";
  await page.waitForSelector(selector);
  const videoUrl = await (page as any).evaluate(
    selector,
    (el: HTMLImageElement) => el.src
  );

  return new NextResponse(videoUrl);
}
