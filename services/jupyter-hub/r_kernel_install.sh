#!/bin/Rscript

install.packages(
   c(
      'rlang',
      'uuid', 
      'digest', 
      'callr', 
      'tidyverse', 
      'dplyr',
      'rversions',
      'shiny',
      'DT',
      'covr',
      'roxygen2',
      'formatR', 
      'remotes', 
      'selectr', 
      'caTools', 
      'stringi', 
      'curl',
      'openssl',
      'git2r',
      'httr',
      'gh',
      'usethis',
      'shiny',
      'RJSONIO',
      'devtools',
      'nloptr',
      'lme4'
       )
       )

install.packages('IRkernel')

IRkernel::installspec(user = FALSE)