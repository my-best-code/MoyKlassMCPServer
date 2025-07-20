package com.mybestcode.moyklassmcpserver.model;

import java.time.LocalDate;
import java.util.List;

/**
 * Дополнительные параметры записи в группу.
 */
public record JoinParams(
        Boolean autoCreateSubs,
        Invoices invoices  // embedded object as per schema
) {
    /**
     * Правила создания счета (только для групп с Формой оплаты Единой суммой/в рассрочку).
     */
    public record Invoices(
            Boolean autoCreate,
            CreateRule createRule,           // enum: create | setStatus
            List<Number> joinStateId,        // array of number
            PayDateType payDateType,         // enum: relative | exact
            Number payDateDays,              // nullable number
            LocalDate payDate                // nullable date
    ) {}

    /** When to create an invoice: `create` or `setStatus`. */
    public enum CreateRule {
        create,
        setStatus
    }

    /** How to set the pay date: `relative` or `exact`. */
    public enum PayDateType {
        relative,
        exact
    }
}