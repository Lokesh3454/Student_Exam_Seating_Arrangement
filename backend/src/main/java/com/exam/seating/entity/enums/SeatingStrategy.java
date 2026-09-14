package com.exam.seating.entity.enums;

/**
 * Strategy utilized for arranging candidates across examination hall seats.
 */
public enum SeatingStrategy {
    SEQUENTIAL,
    RANDOM,
    BRANCH_ALTERNATION,
    SECTION_ALTERNATION,
    ADJACENT_BRANCH_SEPARATION
}
