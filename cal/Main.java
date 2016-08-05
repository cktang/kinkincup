package pokemon;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.URL;

public class Main {

	public Main() throws Throwable {

	    System.getProperties().put("proxySet", "true");
        System.setProperty("http.proxyHost", "webproxy-winhttp.ms.com");
        System.setProperty("http.proxyPort", "8080");
        System.setProperty("https.proxyHost", "webproxy-winhttp.ms.com");
        System.setProperty("https.proxyPort", "8080");
        
		while(true) {			
			System.out.println("reading...");
			String json = getHTML("https://skiplagged.com/api/pokemon.php?bounds=22.236875,114.03415,22.417739,114.30589");			
			writeToFile(json, "C:\\Users\\kint\\code\\kinkincup-gh-pages\\pokemon\\java.json");
			System.out.println("finish writing... " + json.length());
			Thread.sleep(30 * 1000);
			//webproxy-intra-jvc-na.ms.com:8080
		}
	}
	
	public static void writeToFile(String s, String url) throws Throwable, UnsupportedEncodingException {
		PrintWriter writer = new PrintWriter(url, "UTF-8");
		writer.println(s);
		writer.close();
	}

	public static String getHTML(String urlToRead) throws Exception {
        URL oracle = new URL(urlToRead);
        BufferedReader in = new BufferedReader(
        new InputStreamReader(oracle.openStream()));

        String result = "";
        String inputLine;
        while ((inputLine = in.readLine()) != null)
            result += inputLine;
        in.close();
        return result;
	}
	
	public static void main(String args[]) throws Throwable {
		new Main();
	}
	
}
