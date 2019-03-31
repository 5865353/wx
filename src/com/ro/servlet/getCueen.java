package com.ro.servlet;

import com.ro.websocket.testWebsocket;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class getCueen extends HttpServlet {

	public getCueen() {
		super();
	}

	public void destroy() {
		super.destroy(); 
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		List<String> person = getMsg();
		response.getWriter().print(person);
	}

	public static List<String> getMsg() {
		//获得在线好友
		Map<String, testWebsocket> conection = testWebsocket.getCollection();
//		int size = conection.size();
		Iterator<String> iterator = conection.keySet().iterator();
		List<String> person=new ArrayList<String>();
		while(iterator.hasNext()){
			String next = iterator.next();
			testWebsocket ts = conection.get(next);
			//只获取session id
			person.add(next);
		}
		return person;
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doGet(request, response);
	}

	public void init() throws ServletException {
	}

}
