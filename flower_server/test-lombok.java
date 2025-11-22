import lombok.extern.slf4j.Slf4j;
import lombok.Data;

@Data
@Slf4j
public class TestLombok {
    private String name;

    public static void main(String[] args) {
        TestLombok test = new TestLombok();
        test.setName("test");
        log.info("Lombok test: {}", test.getName());
    }
}