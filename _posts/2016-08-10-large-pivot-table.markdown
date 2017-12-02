---
layout: post
title:  "Dynamic Pivot Tables in JavaScript"
date:   2016-08-10 17:27:59 -0400
description: "Example for generating a large pivot table from a CSV dataset using the PivotTable JavaScript library"
---

When preparing data for visualization, it's often easiest to work with datasets in a *long format* versus a *wide format*. 

An example of data in wide format could be a table with multiple columns for different years:

Name |2015|2016|2017
-----|----|----|----
Bob  |10  |20  |25
Alice|14  |16  |18

Converting that to long format, we *unpivot* the year columns, creating a single year column and a value column:

Name | Year | Value
-----|------|------
Bob  |2015  |10
Bob  |2016  |20
Bob  |2017  |25
Alice|2015  |14
Alice|2016  |16
Alice|2017  |18

On the one hand, this approach provides added flexibility in manipulating the data through procedures such as filtering and grouping, and allows additional data to be appended as new records rather than adding new columns to the table. On the other hand, the resulting table includes redundant values and loses readability.

In order to convert the table into a more readable format while keeping the source data in a long format, we can use a library such as [PivotTable.js](https://pivottable.js.org/examples/) to create a pivot table. Given a list of row and column headers as well as a column to run an aggregation function (e.g., sum, count, average)

The following example uses a sample CSV dataset from the NCHS National Health Interview Survey which has been converted from a wide to long format. 

[Pivot Table Mockup](https://alipphardt.github.io/table-mockup/) &#124; [GitHub Repo](https://github.com/alipphardt/alipphardt.github.io/tree/master/table-mockup)

It configures the table as follows:

* Row Headers - Sex, Selected Characteristic, Group
* Column Headers - Lifetime Alcohol Drinking Status, Measure
* Aggregator - Sum on the 'Value' column

The resulting pivot table allows the users to more easily scan nested row and column headings to locate the data value of interest. However, there are a couple limitations to this approach:

* **Aggregate on a single column** - This may be an issue if multiple numeric columns are included in each record. For example, a record that includes a rate, a standard error, and lower/upper confidence limits. This might be addressed by further narrowing the dataset so only one of these measures are included per record. The downside is this increases redundancy as well as the physical size of the dataset.
* **Lack of footnotes** - Records which include footnotes may not be included as text cannot be reconciled by the aggregate function. This may be an issue if an organization requires that specific values be annotated when, for example, they lack statistical reliability.

Future updates to this example code would seek to overcome these shortcomings and potentially examine alternative code libraries implementing pivot tables.
