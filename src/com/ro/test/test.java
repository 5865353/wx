package com.ro.test;

import com.ro.entity.msg;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.util.*;


public class test {
    public static void main(String[] args) {
        msg msg = new msg();
        msg.setName("sss");

        JSONObject jsonObject = JSONObject.fromObject(msg);
        Iterator keys = jsonObject.keys();
        List<String> list = new ArrayList<>();
        while (keys.hasNext()){
            Object next = keys.next();
            if (jsonObject.get(next).equals("")){
                list.add(next.toString());
            }
        }
        System.out.println(list);
        for (String s:list){
            jsonObject.remove(s);
        }
        System.out.println(jsonObject);
    }
}
