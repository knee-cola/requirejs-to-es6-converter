define(['DependencyA', 'DependencyB'],
function(DependencyA, DependencyB)
{
    var MyModule = {
        fn: function() {
            console.log('this is a dummy method');
        }
    }

    return(MyModule);
});