<script src="/js/Chart.min.js"></script>
    var ctx = document.getElementById('BudgetSummaryChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: [

            <% budgets.forEach(function(budget) { %>
                    '<%=budget._doc.name%>',
                    <% });%>

        ],
        datasets: [{
            label: 'monthly budgets',
            data: [ 

                <% budgets.forEach(function(budget) { %>
                        <%=budget._doc.quantity%>,
                        <% });%>

            ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Current Budgets:',
            fontFamily: "'Indie Flower', cursive",
            fontSize: 16 
        },
        legend: {
            position: 'bottom',

        }
    }
});

//<!-- COMMITMENTS SUMMARY CHART DATA -->

//<!--calculate commitments for each category e.g. household utilities  -->
let categoryCommitments = {};
commitments.forEach(function(item) {                           
    if(categoryCommitments.hasOwnProperty(item._doc.category)){  
        categoryCommitments[item._doc.category] = categoryCommitments[item._doc.category] + item._doc.quantity;
    } else {                                                
        categoryCommitments[item._doc.category] = item._doc.quantity;
    }                                                       
}); 

var cty = document.getElementById('CommitmentSummaryChart').getContext('2d');
var secondChart = new Chart(cty, {
    type: 'pie',
    data: {
        labels:[ 
            <% Object.keys(categoryCommitments).forEach(function(item) { 
                if(categoryCommitments[item]<0){  %>

                        '<%=item%>',
                        <% } %>
                    <% });%>
        ],
        datasets: [{
            label: 'Current Commitments:',
            data: [ 
                <% Object.keys(categoryCommitments).forEach(function(item) {
                    if(categoryCommitments[item]<0){  %>
                            <%= -categoryCommitments[item] %>,
                            <% } %>
                        <% });%>
            ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Current Commitments:',
            fontFamily: "'Indie Flower', cursive",
            fontSize: 16 
        },
        legend: {
            position: 'bottom',

        }
    }
});

//<!--TOTAL INCOME AND OUTGOINGS CHART DATA -->
//<!--calculate total income and outgoings  -->
let totalIncome = 0;
let totalOutgoings = 0;

commitments.forEach(function(item) {                           
    if(item._doc.quantity> 0) {
        totalIncome += item._doc.quantity;
    } else {
        totalOutgoings -= item._doc.quantity;
    };
});

budgets.forEach(function(budget) {
    totalOutgoings += budget._doc.quantity;
});

var finance_chart = document.getElementById('FinanceIOChart').getContext('2d'); 
var myBarChart = new Chart(finance_chart, {
    type: 'horizontalBar',
    data: {
        labels: [
            'Income',
            'Outgoings'
        ],
        datasets: [
            {
                label: "Total IO",
                data: [
                    <%=totalIncome.toFixed(2)%>, <%=totalOutgoings.toFixed(2)%>
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ]
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Predicted Income Vs Outgoings:',
            fontFamily: "'Indie Flower', cursive",
            fontSize: 16 
        },
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                ticks: {
                    min: 0,
                }
            }]
        }



    }
});
