package com.mybestcode.moyklassmcpserver.model;

public record ClassAttributeValue(String attributeName,
                                  String attributeAlias,
                                  AttributeType attributeType,
                                  Long attributeId,
                                  Object value  // oneOf: String, Integer, Boolean)
                                  ){
    public enum AttributeType { select, string, number, Boolean}
}
