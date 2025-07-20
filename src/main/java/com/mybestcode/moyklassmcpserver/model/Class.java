package com.mybestcode.moyklassmcpserver.model;

import java.time.OffsetDateTime;
import java.util.List;

public record Class(
        Long id,
        String name,
        OffsetDateTime beginDate,
        Integer maxStudents,
        Status status,
        OffsetDateTime createdAt,
        Long courseId,
        PayType payType,
        Integer filialId,
        Boolean payPass,
        PayPassRules payPassRules,
        Double price,
        String priceComment,
        Boolean showDates,
        String priceForWidget,
        String color,
        List<Integer> managerIds,
        String comment,
        ClassStats stats,
        LessonSettings lessonSettings,
        WorkOff workOff,
        Invoices invoices,
        BonusProgram bonusProgram
) {
    public enum Status {
        opened, closed, archive
    }

    public enum PayType {
        full, lessons
    }

    public record PayPassRules(
            Boolean payPassReason,
            Double payPassReasonRate,
            Boolean payPassNoReason,
            Double payPassNoReasonRate
    ) {}

    public record ClassStats(
            Double income,
            Double debt
    ) {}

    public record LessonSettings(
            Access webinarAccess,
            Access videoAccess,
            Access lessonTaskAccess,
            Access homeTaskAccess
    ) {
        public enum Access {
            always, subExists, invoiceFullPay, invoiceHalfPay
        }
    }

    public record WorkOff(
            Boolean payPassWorkOff,
            Double payPassWorkOffRate,
            Boolean limitWorkOffCount,
            Integer maxWorkOffCount,
            Boolean limitCreateWorkOff,
            LimitCreateWorkOffType limitCreateWorkOffType,
            String limitCreateWorkOffPeriod
    ) {
        public enum LimitCreateWorkOffType {
            sub, period
        }
    }

    public record Invoices(
            Boolean autoCreate,
            CreateRule createRule,
            List<Integer> joinStateId,
            PayDateType payDateType,
            Double payDateDays,
            java.time.LocalDate payDate
    ) {
        public enum CreateRule {
            create, setStatus
        }

        public enum PayDateType {
            relative, exact
        }
    }

    public record BonusProgram(
            Boolean restrictBP,
            Double maxDiscount,
            Double accrueBonuses,
            Double sumLimit
    ) {}
}