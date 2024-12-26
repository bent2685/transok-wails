import React, { useEffect, useState } from "react";
import { GetAppInfo } from "@wa/services/systemService";
import { Uploader } from "@/components/Uploader/Uploader";
const Home: React.FC = () => {
  const [appInfo, setAppInfo] = useState<Record<string, string>>({});
  useEffect(() => {
    GetAppInfo().then((res) => {
      console.log(res);
      setAppInfo(res);
    });
  }, []);
  return (
    <>
      <div>
        <header>
          <h1 className="font-900 text-(6 text)">{appInfo.name}.</h1>
          <p className="text-(3 text2)">高效·快速·无限制 局域网文件分享</p>
        </header>
        <main className="mt-4">
          <Uploader />
          <p className="text-(3 text2) mt-2">无文件格式限制 无大小限制</p>
        </main>
      </div>
    </>
  );
};

export default Home;
