import React, { useEffect, useRef, useState } from "react";
import { GetAppInfo } from "@wa/services/systemService";
import {
  FileInfo,
  Uploader,
  UploaderRef,
} from "@/components/Uploader/Uploader";
import { Button } from "@/components/ui/button";
const Home: React.FC = () => {
  const [appInfo, setAppInfo] = useState<Record<string, string>>({});
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const uploaderRef /* 上传ref */ = useRef<UploaderRef>(null);

  const handleFileSelect = (files: FileInfo[]) => {
    setFileList(files);
  };

  useEffect(() => {
    GetAppInfo().then(setAppInfo);
  }, []);
  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header>
          <h1 className="font-900 text-(6 text)">{appInfo.name}.</h1>
          <p className="text-(3 text2)">高效·快速·无限制 局域网文件分享</p>
        </header>
        <main className="mt-4 flex-1 flex flex-col overflow-hidden">
          <Uploader
            ref={uploaderRef}
            multiple
            onFileSelect={handleFileSelect}
          />
        </main>
        {!!fileList.length && (
          <div className="pos-fixed bottom-0 w-full left-0 flex-center py-8 bg-gradient-to-t from-bg2 to-transparent">
            <div className="w-13 h-13 duration-300 bg-pri rd-full cursor-pointer flex-center shadow-sm shadow-pri/60 hover:(brightness-80)">
              <div className="i-tabler:share text-(text white)"></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
