package com.mybestcode.moyklassmcpserver.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record Join(Long id,                                    // readonly, int64
                   Integer userId,                             // int32
                   Integer classId,                            // int32
                   Integer courseId,                           // int32
                   Double price,                               // nullable double
                   Long statusId,                              // int64
                   OffsetDateTime stateChangedAt,              // nullable date-time (readOnly)
                   Integer statusChangeReasonId,               // nullable int32 (readOnly)
                   Boolean autoJoin,                           // boolean
                   Boolean autoDebit,                          // boolean
                   LocalDate remindDate,                       // nullable date (deprecated)
                   Double remindSum,                           // nullable double (deprecated)
                   Long managerId,                             // nullable int64
                   JoinStats stats,                            // referenced object: components/schemas/JoinStats
                   String comment,// nullable string, from Lesson.properties.comment + maxLength:1000
                   Integer advSourceId,                        // from User.properties/advSourceId
                   Integer createSourceId,                     // from User.properties/createSourceId
                   OffsetDateTime updatedAt,                   // from User.properties/updatedAt
                   OffsetDateTime createdAt,                   // readonly date-time
                   List<Long> tags,                            // nullable array of int64
                   JoinParams params,                          // nullable, from components/schemas/JoinParams
                   List<UserInvoice> invoices)                 // readonly array of UserInvoice
                   {}
