package com.mybestcode.moyklassmcpserver.model;

import java.time.LocalDate;

public record JoinStats(Integer visits,
                        Integer freeVisits,
                        LocalDate nextRecord,    // nullable date
                        LocalDate lastVisit,     // nullable date
                        Integer lessonsLost,
                        Double totalPayed,
                        Integer nonPayedLessons) {
}
