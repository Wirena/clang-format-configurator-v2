//Who uses clang-format to format Java code?

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import static java.util.stream.Collectors.toList;

public class Main {
    /**
     * Merges two given sorted arrays into one
     *
     * @param a1 first sorted array
     * @param a2 second sorted array
     * @return new array containing all elements from a1 and a2, sorted
     */
    public static int[] mergeArrays(int[] a1, int[] a2) {
        int[] res = new int[a1.length + a2.length];
            int it1 = 0, it2 = 0;
            for (int i = 0; i < res.length; ++i) {
                if ((it1 < a1.length) && (it2 < a2.length)) {
                    if (a1[it1] <= a2[it2]) {
                        res[i] = a1[it1];
                        it1++;
                    } else {
                        res[i] = a2[it2];
                        it2++;
                    }
                } else if (it1 == a1.length) {
                    System.arraycopy(a2, it2, res, i, 1);
                    it2++;
                } else {
                    System.arraycopy(a1, it1, res, i, 1);
                    it1++;
                }
            }
            return res;
    }

    @Annotation
    @AnotherAnnotation
    @MoreAnnotations
    public static void top10FrequencyWords()throws IOException{
        Charset charset = Charset.forName("UTF-8");
        Reader reader = new InputStreamReader(System.in, charset);
        BufferedReader bufferedReader = new BufferedReader(reader);
        Stream<String> stream = Arrays.stream(bufferedReader.readLine().toLowerCase().split("[^\\p{L}\\p{Digit}_]+"));
        Map<String, Long> result = stream.collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        Map<String, Long> finalMap = new LinkedHashMap<>();
        result.entrySet().stream().sorted(Map.Entry.<String, Long>comparingByValue().reversed()).forEachOrdered(e -> finalMap.put(e.getKey(), e.getValue()));
        List<Map.Entry> sortedEntries = finalMap.entrySet().stream().sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry::getKey)).collect(toList());
        int cnt = 0;
        for (Map.Entry sortedEntry : sortedEntries) {
            if(cnt>=10)
                break;
            System.out.println(sortedEntry.getKey());
            cnt++;
        }
        System.out.flush();
    }
    

    public static void main(String[] args) {

        try{
            top10FrequencyWords();
        }
        catch(Exception e) {
            System.out.println("Exception");
        }
    }

}