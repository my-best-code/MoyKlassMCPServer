package com.mybestcode.moyklassmcpserver;

import com.mybestcode.moyklassmcpserver.servie.ClassService;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;


@SpringBootApplication
public class MoyKlassApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoyKlassApplication.class, args);
    }

}
