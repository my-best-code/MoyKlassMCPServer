package com.mybestcode.moyklassmcpserver.controller;

import com.mybestcode.moyklassmcpserver.model.Class;
import com.mybestcode.moyklassmcpserver.model.Course;
import com.mybestcode.moyklassmcpserver.model.CourseType;
import com.mybestcode.moyklassmcpserver.servie.ClassService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }
    @GetMapping
    public List<Class> getClasses(
            @RequestParam(required = false) Boolean includeImages,
            @RequestParam(required = false) Boolean includeAttributes,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer filialId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Boolean includeStats
    ) {
        return classService.fetchClasses(
                includeImages, includeAttributes, courseId, filialId, classId, includeStats
        );
    }
}

