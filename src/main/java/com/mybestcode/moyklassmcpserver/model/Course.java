package com.mybestcode.moyklassmcpserver.model;

import java.time.OffsetDateTime;

public record Course(
        Long id,
        String name,
        String shortDescription,
        String siteUrl,
        String description,
        OffsetDateTime createdAt,
        CourseType courseType
) {}
