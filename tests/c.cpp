#include <bits/stdc++.h>
using namespace std;
int main(){
    int n;
    cin>>n;
    while(n--){
    int a[4];
    for(int i=0;i<4;i++){
        cin>>a[i];
    }
    int l=a[2];
    int r=a[3];
    int b=a[1];
    int lc=0;
    int rc=0;
   while(b>0){
    if(lc>=l){
        lc--;
        b--;
    }
    if(rc<=r){
        rc++;
        b--;
    }
   }
   cout<<lc<<" "<<rc<<endl;
}
}