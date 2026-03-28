package com.mybestcode.moyklassmcpserver.model;

import java.time.LocalDate;

public record UserInvoice(Long id,
                          Long userId,
                          LocalDate date,
                          LocalDate createdAt,
                          Float price,
                          Float nextSum,
                          LocalDate payUntil,
                          Long joinId,              // nullable
                          Long userSubscriptionId,  // nullable
                          Float payed,
                          Float payedBonuses,
                          String comment            // nullable
) {
}
