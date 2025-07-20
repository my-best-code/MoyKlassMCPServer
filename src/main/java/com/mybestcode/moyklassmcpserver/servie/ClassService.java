package com.mybestcode.moyklassmcpserver.servie;

import com.mybestcode.moyklassmcpserver.client.ClassClient;
import com.mybestcode.moyklassmcpserver.model.Class;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassService {
    private final ClassClient client;

    public ClassService(ClassClient client) {
        this.client = client;
    }

    @Tool(description = "Возвращает список групп (наборов) компании. Группа представляет собой учебный набор с информацией о программе, филиале, ценах, настройках и статистике.")
    public List<Class> searchClasses(
            @ToolParam(description = "Включить в ответ изображения групп")
            Boolean includeImages,

            @ToolParam(description = "Включить в ответ признаки (дополнительные атрибуты) групп")
            Boolean includeAttributes,

            @ToolParam(description = "ID программы для фильтрации групп")
            List<Long> courseIds,

            @ToolParam(description = "ID филиала для фильтрации групп")
            List<Integer> filialIds,

            @ToolParam(description = "ID конкретной группы для получения")
            List<Long> classIds,

            @ToolParam(description = "Включить в ответ общую информацию по долгу и доходу от группы")
            Boolean includeStats
    ){
        return client.getClasses(
                includeImages, includeAttributes, courseIds, filialIds, classIds, includeStats
        );
    }
}
