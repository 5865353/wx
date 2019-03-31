package com.ro.listener;

import javax.servlet.ServletRequestEvent;
import javax.servlet.ServletRequestListener;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.File;

public class requestListener implements ServletRequestListener {

	@Override
	public void requestDestroyed(ServletRequestEvent arg0) {
		System.out.println("ooooooooooooooooooooooooooooooo");
	}

	@Override
	public void requestInitialized(ServletRequestEvent arg0) {
		System.out.println("ssssssssssssssssssssssssssssssss");
		//将所有request请求都携带上httpSession
        HttpSession session = ((HttpServletRequest) arg0.getServletRequest()).getSession();
       String id = session.getId();
       String realPath = session.getServletContext().getRealPath("/chatRecord");
       File file = new File(realPath);
       if(!file.exists()){
    	   file.mkdir();//创建聊天记录文件夹
       }
       File file2 = new File(realPath, id);
       if(!file2.exists()){
    	   file2.mkdir();//创建个人聊天记录文件夹
       }
	}

}
