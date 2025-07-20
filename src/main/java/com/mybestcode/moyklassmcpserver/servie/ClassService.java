package com.mybestcode.moyklassmcpserver.servie;

import com.mybestcode.moyklassmcpserver.client.ClassClient;
import com.mybestcode.moyklassmcpserver.model.Class;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassService {
    private final ClassClient client;

    public ClassService(ClassClient client) {
        this.client = client;
    }

    public List<Class> fetchClasses(
            Boolean includeImages,
            Boolean includeAttributes,
            Long courseId,
            Integer filialId,
            Long classId,
            Boolean includeStats
    ) {
        return client.getClasses(
                includeImages, includeAttributes, courseId, filialId, classId, includeStats
        );
    }
}
