package com.ro.entity;

import java.io.Serializable;

public class msg implements Serializable {
    private static final long serialVersionUID = 1L;
    // 消息
    private String msg;
    private String sid;
    private String name;//发送人的名字
    private String code;//标识符
    private String tx;//头像--
    private String date;//时间

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getSid() {
        return sid;
    }

    public void setSid(String sid) {
        this.sid = sid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTx() {
        return tx;
    }

    public void setTx(String tx) {
        this.tx = tx;
    }

    @Override
    public String toString() {
        return "msg{" +
                "msg='" + msg + '\'' +
                ", sid='" + sid + '\'' +
                ", name='" + name + '\'' +
                ", code='" + code + '\'' +
                ", tx='" + tx + '\'' +
                '}';
    }

    public msg() {
    }
}

