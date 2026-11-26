package demo.desk;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import java.net.URI;
import java.net.http.*;
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,properties="spring.datasource.url=jdbc:h2:mem:desk;DB_CLOSE_DELAY=-1")
class DeskIntegrationTest {
 @LocalServerPort int port;
 HttpResponse<String> send(String method,String path,String body) throws Exception {
  var req=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api"+path)).header("Content-Type","application/json")
   .method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(body)).build();
  return HttpClient.newHttpClient().send(req,HttpResponse.BodyHandlers.ofString());
 }
 String input(String title,String stage){return """
 {"title":"%s","owner":"Sample team","category":"Batch policy","stage":"%s","context":"RUN-BATCH-19","due":"2027-03-02","notes":"The reviewer confirmed the submitted evidence","amount":3}
 """.formatted(title,stage);}
 @Test void healthAndSeedSearch() throws Exception {
  assertEquals(200,send("GET","/health",null).statusCode());
  assertTrue(send("GET","/records?q=Short",null).body().contains("Short prompts on grouped batches"));
  assertEquals("[]",send("GET","/records?q=no-such-record",null).body());
 }
 @Test void createAndFind() throws Exception {
  var created=send("POST","/records",input("Unique evidence record","Planned"));
  assertEquals(201,created.statusCode());
  assertTrue(send("GET","/records?q=unique%20evidence",null).body().contains("Unique evidence record"));
 }
 @Test void updateAndValidate() throws Exception {
  assertEquals(400,send("POST","/records","{}").statusCode());
  assertEquals(400,send("POST","/records",input("Invalid stage","Unknown")).statusCode());
  assertEquals(404,send("PUT","/records/missing",input("Missing record","Planned")).statusCode());
  assertEquals(400,send("POST","/records",input("Out of range","Planned").replace("\"amount\":3","\"amount\":10001")).statusCode());
  assertEquals(400,send("POST","/records",input("Missing close evidence","Compared").replace("The reviewer confirmed the submitted evidence","Too short")).statusCode());
  var updated=send("PUT","/records/2",input("Revised evidence","Compared"));
  assertEquals(200,updated.statusCode());
  assertTrue(updated.body().contains("Revised evidence"));
 }
}
