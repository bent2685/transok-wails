import { ApiResponse, ShareData } from "../types";

// Use proxy in development, use configured URL in production
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export class ApiService {
  private static getCaptcha(): string | null {
    return localStorage.getItem("captcha");
  }

  private static setCaptcha(captcha: string): void {
    localStorage.setItem("captcha", captcha);
  }

  private static clearCaptcha(): void {
    localStorage.removeItem("captcha");
  }

  static async shouldCaptcha(): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/api/should-captcha`);
      const data: ApiResponse<boolean> = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to check captcha requirement:", error);
      return false;
    }
  }

  static async getShareList(): Promise<ShareData> {
    console.log("Sending request to:", `${baseUrl}/share/list`);
    console.log("Captcha:", this.getCaptcha());

    const response = await fetch(`${baseUrl}/share/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Captcha-Key": this.getCaptcha() || "",
      },
      body: JSON.stringify({}),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<ShareData> = await response.json();
    console.log("Response data:", data);

    if (!data.success) {
      if (data.code === 40003) {
        this.clearCaptcha();
        // Clear captcha parameter from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("captcha");
        window.history.replaceState({}, "", url.toString());
        throw new Error("Captcha expired, please refresh and re-enter");
      }
      throw new Error(data.message || "Failed to get file list");
    }

    // Add captcha to URL
    const url = new URL(window.location.href);
    const captcha = this.getCaptcha();
    if (captcha) {
      url.searchParams.set("captcha", captcha);
      window.history.replaceState({}, "", url.toString());
    }

    return data.data;
  }

  static async downloadFile(filePath: string): Promise<void> {
    try {
      // 构造完整 URL
      const captcha = this.getCaptcha();
      const url = `${baseUrl}/download/index?filePath=${encodeURIComponent(
        filePath
      )}`;

      // 使用 <a> 直接发起请求（浏览器会立即触发下载提示）
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() || "download";
      a.rel = "noopener"; // 防止安全警告
      a.target = "_blank"; // 避免阻塞主线程

      // 附带 captcha 信息（改用 query 参数方式，因为 <a> 无法带 header）
      if (captcha) {
        a.href +=
          (url.includes("?") ? "&" : "?") +
          "captcha-key=" +
          encodeURIComponent(captcha);
      }

      // 模拟点击
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }
  static initializeCaptcha(): void {
    // Get captcha from URL
    const url = new URL(window.location.href);
    const captchaInUrl = url.searchParams.get("captcha");

    if (captchaInUrl) {
      this.setCaptcha(captchaInUrl);
    } else {
      this.clearCaptcha();
    }
  }

  static promptForCaptcha(): string | null {
    const captcha = window.prompt("Please enter captcha");
    if (captcha) {
      this.setCaptcha(captcha);
    }
    return captcha;
  }
}
