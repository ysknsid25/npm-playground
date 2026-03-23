struct DataA<'a> {
    number_a: Option<&'a i32>,
}

struct DataB<'a> {
    number_b: Option<&'a i32>,
}

fn setData(data_a: &mut DataA, data_b: &mut DataB, num: i32) {
    let number = Box::new(num + 10);
    data_a.number_a = Some(&number);
    data_b.number_b = Some(&number);
}

fn func_ex_div_some(x: i32, y: i32) -> Option<i32> {
    let ans = if y == 0 {
        None
    } else {
        Some(x / y)
    };
    ans
}

fn func_ex_div_result(x: i32, y: i32) -> Result<i32, &'static str> {
    if y == 0 {
        Err("division by zero")
    } else {
        Ok(x / y)
    }
}

fn func_ex_print_some<T: std::fmt::Display>(ans: Option<T>) {
    if let Some(x) = ans {
        println!("ans: {x}");
    } else {
        println!("ans: None");
    }
}

fn func_ex_print_some_match<T: std::fmt::Display>(ans: Option<T>) {
    match ans {
        Some(x) => println!("ans: {x}"),
        None => println!("ans: None"),
    }
}

fn func_ex_print_result<T: std::fmt::Display, E: std::fmt::Display>(ans: Result<T, E>) {
    match ans {
        Ok(x) => println!("ans: {x}"),
        Err(e) => println!("ans: Err({e})"),
    }
}

fn main() {
    let ans = func_ex_div_some(10, 2);
    func_ex_print_some(ans);

    let ans = func_ex_div_some(10, 0);
    func_ex_print_some(ans);

    func_ex_print_some_match(func_ex_div_some(10, 0));

    let ans = func_ex_div_result(10, 2);
    func_ex_print_result(ans);

    let ans = func_ex_div_result(10, 0);
    func_ex_print_result(ans);

    let boxed = Box::new(10);
    let val = *boxed;
    println!("val = {}", val);
}
