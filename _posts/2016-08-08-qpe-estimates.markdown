---
layout: post
title:  "NVSS Quarterly Provisional Estimates"
date:   2016-08-08 17:27:59 -0400
description: "Several sample data visualizations created in D3 and Tableau for NVSS Rapid Release of Quarterly Provisional Estimates."
---

The following designs were developed for the initial release of the [NVSS Rapid Release of Quarterly Provisional Estimates](https://www.cdc.gov/nchs/nvss/vsrr.htm). This reports series from the National Centers for Health Statistics includes select indicators of mortality, natality and infant mortality.

[Mortality Dashboard](https://alipphardt.github.io/mortality-dashboard/) &#124; [GitHub Repo](https://github.com/alipphardt/alipphardt.github.io/tree/master/mortality-dashboard)

[Natality Dashboard D3 Version](https://alipphardt.github.io/natality-dashboard/) &#124; [GitHub Repo](https://github.com/alipphardt/alipphardt.github.io/tree/master/natality-dashboard)

[Natality Dashboard - Tableau Version](https://alipphardt.github.io/natality-dashboard-tableau/) &#124; [GitHub Repo](https://github.com/alipphardt/alipphardt.github.io/tree/master/natality-dashboard-tableau)

![Screenshot, Natality Dashboard](/images/qpe-estimates/natality-dashboard-screenshot.png)


The designs were developed with the D3 JavaScript library and had the following requirements:

* Read data locally from CSV file on the web server
* Responsive behavior within BootStrap 2 framework
* Ability to save the SVG canvas as a PNG image
* Ensure accessibilty (i.e. 508 compliance) of the final design
* With Natality and Infant Mortality, allow users to select which indicators to include on the chart.

Since the initial release, the designs were updated to incorporate dynamic infographics presenting key trends. This replaced static text provided by the authors with scripted text updated with values dynamically from the dataset.

![Infographics example from Natality Dashboard](/images/qpe-estimates/infographics.png)

Future updates to the designs may include access of dataset from Socrata API endpoint rather than CSV and modification of the design for BootStrap 4 framework. 
