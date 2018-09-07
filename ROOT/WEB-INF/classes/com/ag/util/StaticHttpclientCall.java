package com.ag.util;

/**
 * Created by Guo on 2017/11/22.
 * 检验检疫报文通用设置。
 */

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.wb.util.DbUtil;
import com.wb.util.StringUtil;
import com.alibaba.fastjson.JSONArray;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import sun.misc.BASE64Encoder;

import java.io.IOException;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.Date;

public class StaticHttpclientCall {
    static int socketTimeout = 30000;// 请求超时时间
    static int connectTimeout = 30000;// 传输超时时间

    /**
     * @param args
     * @throws IOException
     * @throws HttpException
     */
    public static void main(String[] args) throws Exception, IOException {
        // TODO Auto-generated method stub


        System.out.println(getMD5("zhangrui"));
    }

    public static void getCk(String tokenId) {
        Connection connection = null;
        try {

            PostMethod postMethod = new PostMethod(
                    "http://decl.gdciq.gov.cn/ciqorderplat/api/v1/orderplat/getorderlist?TokenId=" + tokenId);
            HttpClient httpClient = new HttpClient();
            connection = DbUtil.getConnection();
            PreparedStatement ps = connection.prepareStatement("insert  into CN_SJCK (UUID, DECL_NO, BILL_LOAD_NO, IE_FLAG, " +
                    "CONSIGNEE_NAME, INSTRUCTION_TIME, PASSTYPE, CNTR, TENANCY_ID) values(?,?,?,?,?,?,?,?,?)");
            long beg = (new Date()).getTime();
            System.out.println("测试代码");
            int statusCode = httpClient.executeMethod(postMethod);
            if (statusCode == 200) {
                System.out.println("调用成功！");
                String soapResponseData = postMethod.getResponseBodyAsString();
                JSONObject js = JSON.parseObject(soapResponseData);
                long end = (new Date()).getTime();
                JSONArray jsonArray = (JSONArray) js.get("items");
                for (int i = 0; i < jsonArray.size(); i++) {
                    JSONObject jsonObject = (JSONObject) jsonArray.get(i);
                    ps.setString(1, StringUtil.toString(jsonObject.get("uuid")));
                    System.out.println(StringUtil.toString(jsonObject.get("uuid")));
                    ps.setString(2, StringUtil.toString(jsonObject.get("DeclNo")));
                    ps.setString(3, StringUtil.toString(jsonObject.get("BillLadNo")));
                    ps.setString(4, StringUtil.toString(jsonObject.get("IeFlag")));
                    ps.setString(5, StringUtil.toString(jsonObject.get("ConsigneeName")));
                    ps.setString(6, StringUtil.toString(jsonObject.get("InstructionTime")));
                    ps.setString(7, StringUtil.toString(jsonObject.get("PassType")));
                    ps.setString(8, StringUtil.toString(jsonObject.get("ContNo")));
                    ps.setString(9, StringUtil.toString(jsonObject.get("tenancyId")));
                    ps.addBatch();
                }
                ps.executeBatch();
                updateorderstate(jsonArray, tokenId);
                System.out.println((end - beg) + "==" + soapResponseData);
            } else {
                System.out.println("调用失败！错误码：" + statusCode);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DbUtil.close(connection);
        }
    }


    public static void getFangXing(String tokenId) {
        Connection connection = null;
        try {

            PostMethod postMethod = new PostMethod(
                    "http://decl.gdciq.gov.cn/ciqorderplat/api/v1/orderplat/getreleaseList?TokenId=" + tokenId);
            HttpClient httpClient = new HttpClient();
            connection = DbUtil.getConnection();
            PreparedStatement ps = connection.prepareStatement("insert  into CN_SJRELEASE (UUID, DECL_NO, BILL_LOAD_NO, IE_FLAG, " +
                    "CONSIGNEE_NAME, INSTRUCTION_TIME, PASSTYPE, CNTR, TENANCY_ID) values(?,?,?,?,?,?,?,?,?)");
            long beg = (new Date()).getTime();
            System.out.println("测试代码");
            int statusCode = httpClient.executeMethod(postMethod);
            if (statusCode == 200) {
                System.out.println("调用成功！");
                String soapResponseData = postMethod.getResponseBodyAsString();
                JSONObject js = JSON.parseObject(soapResponseData);
                long end = (new Date()).getTime();
                JSONArray jsonArray = (JSONArray) js.get("items");
                for (int i = 0; i < jsonArray.size(); i++) {
                    JSONObject jsonObject = (JSONObject) jsonArray.get(i);
                    ps.setString(1, StringUtil.toString(jsonObject.get("uuid")));
                    System.out.println(StringUtil.toString(jsonObject.get("uuid")));
                    ps.setString(2, StringUtil.toString(jsonObject.get("DeclNo")));
                    ps.setString(3, StringUtil.toString(jsonObject.get("BillLadNo")));
                    ps.setString(4, StringUtil.toString(jsonObject.get("IeFlag")));
                    ps.setString(5, StringUtil.toString(jsonObject.get("ConsigneeName")));
                    ps.setString(6, StringUtil.toString(jsonObject.get("InstructionTime")));
                    ps.setString(7, StringUtil.toString(jsonObject.get("PassType")));
                    ps.setString(8, StringUtil.toString(jsonObject.get("ContNo")));
                    ps.setString(9, StringUtil.toString(jsonObject.get("tenancyId")));
                    ps.addBatch();
                }
                ps.executeBatch();
                updateorderstate(jsonArray, tokenId);
                System.out.println((end - beg) + "==" + soapResponseData);
            } else {
                System.out.println("调用失败！错误码：" + statusCode);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DbUtil.close(connection);
        }
    }

    public static void updateorderstate(JSONArray jsonArray, String tockenId) {
        for (int i = 0; i < jsonArray.size(); i++) {
            JSONObject jsonObject = (JSONObject) jsonArray.get(i);
            String url = "http://decl.gdciq.gov.cn/ciqorderplat/api/v1/orderplat/updateorderstate?TokenId" +
                    "=" + tockenId + "&uuid=" + StringUtil.toString(jsonObject.get("uuid")) + "&declno=116000000881373";
            proWebservice(url);
        }
    }

    /*
        获得tokienId
    */
    public static String getTokien(String tenancyId) throws Exception {
        String tokenId = null;

        String password = getMD5("zhangrui");
        if (tenancyId.equals("ZSG"))
            password = getMD5("zhangrui");
        else if (tenancyId.equals("XLG"))
            password = getMD5("zhangrui");
        else
            password = getMD5("zhangrui");
        System.out.println(password);
        PostMethod postMethod = new PostMethod(
                "http://decl.gdciq.gov.cn/ciqorderplat/api/v1/orderplat/login?username=zsghjtzr&password=3bca06a34cbf27a10dbf5f93bb91fcda");

        // 最后生成一个HttpClient对象，并发出postMethod请求
        HttpClient httpClient = new HttpClient();
        int statusCode = httpClient.executeMethod(postMethod);
        if (statusCode == 200) {
            System.out.println("调用成功！");
            String soapResponseData = postMethod.getResponseBodyAsString();
            JSONObject js = JSON.parseObject(soapResponseData);
            tokenId = StringUtil.toString(js.get("TokenId"));
            System.out.println(soapResponseData);
        } else {
            System.out.println("调用失败！错误码：" + statusCode);
        }
        return tokenId;

    }

    /**
     * 商检更新状态接口
     *
     * @param url
     * @return
     */
    public static String proWebservice(String url) {
        PostMethod postMethod = new PostMethod(
                url);
        String soapResponseData = null;
        // 最后生成一个HttpClient对象，并发出postMethod请求
        HttpClient httpClient = new HttpClient();
        try {

            int statusCode = httpClient.executeMethod(postMethod);
            if (statusCode == 200) {
                System.out.println("调用成功！");
                soapResponseData = postMethod.getResponseBodyAsString();
                JSONObject js = JSON.parseObject(soapResponseData);
                System.out.println(soapResponseData);
            } else {
                System.out.println("调用失败！错误码：" + statusCode);
            }
        } catch (Exception e) {
            e.printStackTrace();

        } finally {
            return soapResponseData;
        }

    }

    public static String EncoderByMd5(String str) throws Exception {
        //确定计算方法

        MessageDigest md5 = MessageDigest.getInstance("MD5");

        BASE64Encoder base64en = new BASE64Encoder();
        //加密后的字符串
        String newstr = base64en.encode(md5.digest(str.getBytes("utf-8")));
        return newstr;
    }

    public static String getMD5(String message) {
        String md5str = "";
        try {
            // 1 创建一个提供信息摘要算法的对象，初始化为md5算法对象
            MessageDigest md = MessageDigest.getInstance("MD5");

            // 2 将消息变成byte数组
            byte[] input = message.getBytes();

            // 3 计算后获得字节数组,这就是那128位了
            byte[] buff = md.digest(input);

            // 4 把数组每一字节（一个字节占八位）换成16进制连成md5字符串
            md5str = bytesToHex(buff);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return md5str;
    }

    public static void sendSjWbservice(String xml) throws Exception {
        String tokenId = getTokien("ZSG");
        String url = "http://61.144.22.86/Manifest/ManifestDeclService.asmx";
    }

    public static String bytesToHex(byte[] bytes) {
        StringBuffer md5str = new StringBuffer();
        // 把数组每一字节换成16进制连成md5字符串
        int digital;
        for (int i = 0; i < bytes.length; i++) {
            digital = bytes[i];

            if (digital < 0) {
                digital += 256;
            }
            if (digital < 16) {
                md5str.append("0");
            }
            md5str.append(Integer.toHexString(digital));
        }
        return md5str.toString();
    }


    /**
     * 使用SOAP1.1发送消息
     *
     * @param soapXml
     * @return
     */
    public static String doPostSoap(String soapXml, String fileName) {


        String postUrl = "http://61.144.22.86/Manifest/ManifestDeclService.asmx",
        soapAction = "http://tempuri.org/ManifestDecl";

        soapXml = StringEscapeUtils.escapeXml11(soapXml);
        StringBuffer message1 = new StringBuffer("\n" +
                "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
                "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n" +
                "  <soap:Body>\n" +
                "    <ManifestDecl xmlns=\"http://tempuri.org/\">\n" +
                "      <ManifestXml>" + soapXml + "</ManifestXml>\n" +
                "      <fileName>" + fileName + "</fileName>\n" +
                "    </ManifestDecl>\n" +
                "  </soap:Body>\n" +
                "</soap:Envelope>");
        String retStr = "";
        // 创建HttpClientBuilder
        HttpClientBuilder httpClientBuilder = HttpClientBuilder.create();

        // HttpClient
        CloseableHttpClient closeableHttpClient = httpClientBuilder.build();

        HttpPost httpPost = new HttpPost(postUrl);

        //  设置请求和传输超时时间
        RequestConfig requestConfig = RequestConfig.custom()
                .setSocketTimeout(socketTimeout)
                .setConnectTimeout(connectTimeout).build();

        httpPost.setConfig(requestConfig);
        try {
            httpPost.setHeader("Content-Type", "text/xml;charset=UTF-8");
            httpPost.setHeader("SOAPAction", soapAction);
            StringEntity data = new StringEntity(message1.toString(),
                    Charset.forName("UTF-8"));

            httpPost.setEntity(data);
            CloseableHttpResponse response = closeableHttpClient
                    .execute(httpPost);

            HttpEntity httpEntity = response.getEntity();

            if (httpEntity != null) {
                // 打印响应内容
                retStr = EntityUtils.toString(httpEntity, "UTF-8");

                System.out.println("response:" + retStr);
            }
            // 释放资源
            closeableHttpClient.close();
        } catch (Exception e) {
            System.out.println("exception in doPostSoap1_1" + e);
        }

        return retStr;
    }
}