pragma circom 2.1.5;

template Multiplier3() {
    signal input a;
    signal input b;
    signal input c;
    signal output out;

    signal temp;
    
    temp <== a * b;
    out <== temp * c;
}

component main = Multiplier3(); 