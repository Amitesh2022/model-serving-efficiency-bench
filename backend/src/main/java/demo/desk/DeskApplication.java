package demo.desk;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import java.time.LocalDate;
@SpringBootApplication
public class DeskApplication {
 public static void main(String[] args) { SpringApplication.run(DeskApplication.class,args); }
 @Bean CommandLineRunner seed(DeskRepository repo) {
  return args -> { if (repo.all().isEmpty()) {
  repo.insert("1",new DeskRecord.Input("Short prompts on grouped batches","Runtime quality team","Batch policy","Planned","RUN-BATCH-06",LocalDate.now().plusDays(2),"Baseline uses single requests; use the same short prompt pool for comparison.",470));
  repo.insert("2",new DeskRecord.Input("Low-load accelerator pool","Platform efficiency","Hardware pool","Measured","RUN-POOL-02",LocalDate.now().plusDays(6),"Record idle draw separately from active request energy.",620));
  repo.insert("3",new DeskRecord.Input("Compact model format baseline","Inference lab","Model format","Compared","RUN-FMT-05",LocalDate.now().plusDays(10),"Compared response quality and latency with the baseline using the same prompt mix.",315));
  repo.insert("4",new DeskRecord.Input("Document summaries at peak load","Runtime quality team","Batch policy","Planned","RUN-BATCH-12",LocalDate.now().plusDays(14),"Keep max output length fixed through the peak-load comparison.",540));
  repo.insert("5",new DeskRecord.Input("Mixed request hardware trial","Platform efficiency","Hardware pool","Measured","RUN-POOL-07",LocalDate.now().plusDays(18),"Note the accelerator and host meter boundaries.",505));
  repo.insert("6",new DeskRecord.Input("Long-context quantisation check","Inference lab","Model format","Compared","RUN-FMT-15",LocalDate.now().plusDays(22),"Compared long-context latency and quality against the original model format.",292));
  }};
 }
}
