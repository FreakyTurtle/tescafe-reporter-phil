export default function () {
    return {
        noColors:     true, 
        startTime:    null, 
        afterErrList: false, 
        uaList:       null,
        report:       '',
        // report:       '<html><head><!-- Latest compiled and minified CSS --><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"><!-- Optional theme --><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp"crossorigin="anonymous"></head><body>', 
        table:        '', 
        tableReports: '',
        testCount:    0,
        skipped:      0,
        
        
        reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.uaList    = userAgents.join(', ');
            this.testCount = testCount;
        },

        reportFixtureStart (name /*, path */) {
            this.currentFixtureName = name;
        },

        reportTestDone (name, testRunInfo) {
            const hasErr = !!testRunInfo.errs.length;
            const result = hasErr ? `failed` : `passed`;
            
            if (testRunInfo.skipped)
                this.skipped++;
                
            this._compileTestTable(name, testRunInfo, hasErr, result);
            if (hasErr)
                this._compileErrors(name, testRunInfo);
                
        },
        
        _compileErrors (name, testRunInfo) {
            const heading = this.currentFixtureName + ' - ' + name;
            
            this.report += this.indentString(`<h4>${heading}</h4>\n`);
            testRunInfo.errs.forEach((error) => {
                this.report += this.indentString(`<pre>`);
                this.report += this.formatError(error, '');
                this.report += this.indentString(`</pre>`);
            });
        },
        
        _compileTestTable (name, testRunInfo, hasErr, result) {
            
            if (hasErr) 
                this.tableReports += this.indentString('<tr class="danger">\n');
            else if (testRunInfo.skipped)
                this.tableReports += this.indentString('<tr class="warning">\n');
            else
                this.tableReports += this.indentString('<tr class="success">\n');
            
            //Fixture
            this.tableReports += this.indentString('<td>', 2);
            this.tableReports += this.currentFixtureName;
            this.tableReports += '</td>\n';
            //Test
            this.tableReports += this.indentString('<td>', 2);
            this.tableReports += name;
            this.tableReports += '</td>\n';
            //Browsers
            this.tableReports += this.indentString('<td>', 2);
            this.tableReports += this.uaList;
            this.tableReports += '</td>\n';
            //TestCount
            this.tableReports += this.indentString('<td>', 2);
            this.tableReports += this.testCount;
            this.tableReports += '</td>\n';
            //Duration
            this.tableReports += this.indentString('<td>', 2);
            this.tableReports += this.moment.duration(testRunInfo.durationMs).format('h[h] mm[m] ss[s]');
            this.tableReports += '</td>\n';
            //Result
            this.tableReports += this.indentString('<td>', 2);
            if (testRunInfo.skipped)
                this.tableReports += 'skipped';
            else
                this.tableReports += result;
            
            this.tableReports += '</td>\n';
            
            this.tableReports += this.indentString('</tr>\n');
        },
        
        reportTaskDone (endTime, passed/*, warnings*/) {
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
            const failed = this.testCount - passed;
            // let footer = passed === this.testCount ?
            //      `${this.testCount} passed` :
            //      `${this.testCount - passed}/${this.testCount} failed`;
                 
            // footer += ` (Duration: ${durationStr})`;
            
            //Opening html 
            this.write('<html>')
                .newline()
                .setIndent(1)
                .write('<head>')
                .newline()
                .setIndent(2)
                .write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">')
                .newline()
                .write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">')
                .newline()
                .setIndent(1)
                .write('</head>')
                .newline()
                .write('</body>');
                
            //Now add a summary 
            this.write('<h2>TestCafe Test Summary </h2>')
                .newline()
                .write('<br>')
                .newline()
                .write('<h3>Summary</h3>')
                .newline()
                .write(`<p>Start Time: ${this.startTime}</p>`)
                .newline()
                .write(`<p>Browsers: ${this.uaList}</p>`)
                .newline()
                .write(`<p>Duration: ${durationStr}</p>`)
                .newline()
                .write(`<p>Tests Failed: ${failed} out of ${this.testCount}</p>`)
                .newline()
                .write(`<p>Tests Skipped: ${this.skipped}</p>`)
                .newline();
            
            //Summary table
            let table = '<table class="table ">';
            
            table += this.indentString('<tr>');
            table += this.indentString('<th>Fixture</th>', 2);
            table += this.indentString('<th>Test Name</th>', 2);
            table += this.indentString('<th>Browsers</th>', 2);
            table += this.indentString('<th>Test Count</th>', 2);
            table += this.indentString('<th>Duration</th>', 2);
            table += this.indentString('<th>Result</th>', 2);
            table += this.indentString('</tr>');
            table += this.tableReports;
            table += '</table>';
            this.write(table)
                .newline()
                .write('<br><br>');
                
                
            //Error details
            this.write(`<h3>Error Details</h3><br>`)
                .newline()
                .write(this.report)
                .newline();
            
            //closing html
            this.write('</body></html>');
        }
    };
}
